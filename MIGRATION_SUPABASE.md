# Migration Supabase → Backend Node.js + PostgreSQL local

Ce projet a été migré de Supabase vers une pile entièrement self-hosted :
- **Frontend** : Vite + React (inchangé dans sa logique — un shim compatible Supabase intercepte les appels)
- **Backend** : Node.js + Express + TypeScript + Prisma (nouveau, dans `backend/`)
- **Base de données** : PostgreSQL 16 + extension `pgvector`
- **Storage** : filesystem local (`backend/storage/`)
- **Realtime** : Socket.io (remplace Supabase Realtime)
- **Auth** : JWT custom (bcrypt + jsonwebtoken)

---

## Structure du projet

```
.
├── src/                    # Frontend React
│   ├── api/                # Nouveau client HTTP + shims Supabase-compatibles
│   │   ├── client.ts       # fetch wrapper + token management
│   │   ├── query-builder.ts # Supabase .from().select().eq().order() compatible
│   │   ├── auth-shim.ts    # supabase.auth.* compatible
│   │   ├── storage-shim.ts # supabase.storage.* compatible
│   │   ├── functions-shim.ts # supabase.functions.invoke() compatible
│   │   └── realtime-shim.ts # supabase.channel().subscribe() via socket.io
│   └── integrations/supabase/client.ts  # Re-exporte les shims
│
├── backend/                # Nouveau backend
│   ├── src/
│   │   ├── app.ts          # Express bootstrap
│   │   ├── index.ts        # HTTP server + socket.io
│   │   ├── config/env.ts   # Validation zod des variables d'env
│   │   ├── lib/            # prisma, jwt, password, storage, crud
│   │   ├── middleware/     # auth, error, upload
│   │   ├── routes/         # Routes CRUD pour les 27 tables
│   │   │   └── functions/  # 32 edge functions portées
│   │   ├── services/       # OpenAI, Google Vision, PDFRest, embeddings
│   │   └── realtime/       # Socket.io namespace /progress
│   ├── prisma/
│   │   ├── schema.prisma   # 27 modèles + 2 enums + pgvector
│   │   └── seed.ts         # Crée le super-admin initial
│   └── scripts/            # Migration des données depuis Supabase
│
├── docker-compose.yml      # PostgreSQL 16 + pgvector (dev local)
└── .github/workflows/deploy.yml  # CI/CD : build + deploy frontend & backend sur le VPS
```

---

## Démarrage en dev local

### 1. Démarrer PostgreSQL

```bash
docker-compose up -d
```

### 2. Configurer le backend

```bash
cd backend
cp .env.example .env
# Éditer .env : au minimum DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, GOOGLE_VISION_API_KEY, PDFREST_API_KEY
npm install
npx prisma migrate dev --name init
npm run seed   # Crée le super-admin
npm run dev    # Backend sur http://localhost:4000
```

### 3. Démarrer le frontend

```bash
# Dans un autre terminal, à la racine
npm install
npm run dev    # Frontend sur http://localhost:3000 (ou 8080)
```

Le frontend utilise `VITE_API_URL=http://localhost:4000` (défini dans `.env`).

---

## Migration des données existantes depuis Supabase

Une fois le backend et PostgreSQL prêts :

### 1. Exporter les données Supabase

Récupérer la connection string depuis le dashboard Supabase (Settings → Database → Connection string → URI).

```bash
pg_dump --no-owner --no-acl --schema=public -Fc \
  "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
  > supabase-dump.dump
```

### 2. Importer dans la DB locale

```bash
cd backend
npx tsx scripts/import-supabase-dump.ts ../supabase-dump.dump
```

### 3. Migrer les utilisateurs

```bash
npx tsx scripts/migrate-auth-users.ts https://[REF].supabase.co [SERVICE_ROLE_KEY]
```

**Important** : Les hashes bcrypt Supabase peuvent ne pas être compatibles avec notre format. Prévoir un flow "mot de passe oublié" pour les utilisateurs ou un reset manuel.

### 4. Migrer les fichiers storage

```bash
npx tsx scripts/migrate-storage.ts https://[REF].supabase.co [SERVICE_ROLE_KEY]
```

Cela télécharge les buckets `documents` et `media` dans `backend/storage/` et réécrit les URLs dans la base de données.

---

## Déploiement sur VPS (102.204.206.147)

### Préparation unique du VPS

```bash
ssh root@102.204.206.147

# PostgreSQL 16 + pgvector
apt update && apt upgrade -y
apt install -y postgresql postgresql-contrib postgresql-16-pgvector nodejs npm
npm install -g pm2

# Base de données
sudo -u postgres psql <<EOF
CREATE DATABASE justclick;
CREATE USER justclick_app WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE justclick TO justclick_app;
\c justclick
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
GRANT ALL ON SCHEMA public TO justclick_app;
EOF

# Structure des dossiers
mkdir -p /var/www/app/dist /var/www/app/backend/storage/{documents,media}

# Nginx (déjà installé — mettre à jour la config)
cat > /etc/nginx/sites-available/app << 'EOF'
$(cat nginx.conf)
EOF
ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### Secrets GitHub à ajouter

Dans **Settings → Secrets and variables → Actions** du repo :

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | `102.204.206.147` |
| `VPS_USER` | `root` |
| `VPS_PASSWORD` | mot de passe SSH |
| `DATABASE_URL` | `postgresql://justclick_app:CHANGE_ME@localhost:5432/justclick?schema=public` |
| `JWT_SECRET` | 64+ chars aléatoires (ex: `openssl rand -hex 64`) |
| `OPENAI_API_KEY` | clé OpenAI |
| `GOOGLE_VISION_API_KEY` | clé Google Vision |
| `PDFREST_API_KEY` | clé PDFRest |
| `DEEPL_API_KEY` | (optionnel) |
| `SEED_ADMIN_EMAIL` | email du super-admin |
| `SEED_ADMIN_PASSWORD` | mot de passe initial |

### Déploiement automatique

Chaque push sur `main` déclenche `.github/workflows/deploy.yml` qui :
1. Build le frontend (`npm run build`) → `dist/`
2. Build le backend (`tsc`) → `backend/dist/`
3. Copie les deux sur le VPS
4. Applique les migrations Prisma (`prisma migrate deploy`)
5. Redémarre l'API via PM2 et recharge Nginx

---

## Endpoints principaux

### Auth
- `POST /api/auth/login` — `{email, password}` → `{token, user}`
- `GET /api/auth/me` — retourne le user courant
- `POST /api/auth/logout`

### CRUD
- `GET|POST|PATCH|DELETE /api/documents`
- `GET|POST|PATCH|DELETE /api/categories`
- `GET|POST|PATCH|DELETE /api/events`
- (…et toutes les autres ressources — voir `backend/src/app.ts`)

### Edge functions (32 portées)
- `POST /api/fn/<function-name>` — ex: `POST /api/fn/ai-semantic-search`
- Voir `backend/src/routes/functions/index.ts` pour la liste complète

### Storage
- `POST /api/storage/:bucket/upload` (multipart)
- `GET /api/storage/:bucket/<key>` (+ `?token=` pour bucket privé)
- `DELETE /api/storage/:bucket/<key>`

### Realtime
- `ws://host/socket.io/` namespace `/progress`
- `socket.emit('subscribe:job', jobId)` pour recevoir les updates d'un job

---

## Points d'attention

1. **Shim compatibilité** : Le fichier `src/integrations/supabase/client.ts` a été remplacé par un shim qui traduit les appels Supabase vers le backend. Les 24 hooks et 17 composants admin continuent de fonctionner **sans modification**.

2. **Limites du shim** : Le query builder supporte la plupart des cas (`eq`, `gt`, `gte`, `lt`, `lte`, `in`, `ilike`, `order`, `limit`, `single`), mais pas les relations nestées complexes (`.select('*, relation(*)')`) ni certains opérateurs rares. Les cas non supportés sont signalés par `console.warn`.

3. **Schéma Prisma** : Les 63 migrations SQL Supabase ont été consolidées dans `backend/prisma/schema.prisma`. La première migration Prisma (`npx prisma migrate dev --name init`) crée toutes les tables de zéro. Pour importer des données existantes, utiliser `scripts/import-supabase-dump.ts` après la migration.

4. **pgvector** : La colonne `embedding vector(1536)` sur `documents` n'est pas typée dans Prisma (non supporté nativement). Elle est ajoutée par une migration raw SQL après le `prisma migrate dev`, et accédée via `prisma.$queryRawUnsafe`.

5. **Les policies RLS sont remplacées par du code middleware** dans `backend/src/middleware/auth.ts` (`requireRole`). Vérifier manuellement chaque route sensible pendant les tests.

6. **Downtime lors du switch prod** : Prévoir un freeze de ~1h pour faire le dump Supabase, restaurer sur le VPS, redéployer et basculer.

---

## Checklist post-migration

- [ ] `docker-compose up -d` démarre Postgres
- [ ] `cd backend && npm run dev` démarre l'API
- [ ] `npm run dev` démarre le frontend
- [ ] Login avec le super-admin fonctionne
- [ ] Upload d'un document fonctionne
- [ ] Liste des documents s'affiche
- [ ] Recherche fonctionne
- [ ] Commentaires fonctionnent
- [ ] Les événements et news s'affichent
- [ ] Realtime : progression d'un batch OCR visible
- [ ] Sur le VPS : `http://102.204.206.147` sert la nouvelle version
- [ ] Pipeline CI/CD déploie correctement sur push vers `main`
- [ ] Les anciens documents de Supabase sont visibles après la migration
- [ ] `grep -r "@supabase/supabase-js" src/` ne retourne rien
- [ ] Projet Supabase peut être désactivé
