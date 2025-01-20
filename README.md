
# TicketMaster Events Export Service

Ce projet est un service backend permettant d'exporter les événements de **TicketMaster** en utilisant l'API de TicketMaster. Il nécessite une **API Key** valide pour fonctionner. 

## Description

Le service interroge l'API de TicketMaster pour obtenir des événements en fonction des critères fournis, puis les renvoie sous forme d'un csv. Vous pouvez spécifier la période de temps, et d'autres paramètres pour filtrer les résultats.

## Prérequis

- **Node.js** version >= 14
- **NestJS** framework
- **TypeScript**
- **API Key** de TicketMaster

## Installation

### 1. Clonez le projet

```bash
git clone https://github.com/MiltonEu/vitrine-challenge.git
cd vitrine-challenge
```

### 2. Installez les dépendances

```bash
npm install
```

### 3. Configurez l'API Key

Dans le fichier `.env`, vous devez définir votre clé API TicketMaster comme suit :

```env
TICKETMASTER_API_KEY=your_ticketmaster_api_key
```

### 4. Lancer le service

Vous pouvez démarrer le serveur avec la commande suivante :

```bash
npm run start
```

Le service sera accessible à l'adresse suivante : `http://localhost:3000`.

## Fonctionnalités

### Paramètres de la requête

Le controller de ce service accepte les paramètres suivants :

- **startDateTime** (string, optionnel) : La date de début pour les événements. Format : `YYYY-MM-DDTHH:MM:SSZ`. Valeur par défaut : `2025-02-01T00:00:00Z`.
- **endDateTime** (string, optionnel) : La date de fin pour les événements. Format : `YYYY-MM-DDTHH:MM:SSZ`. Valeur par défaut : `2025-06-30T23:59:59Z`.
- **stateCode** (string, optionnel) : Le code d'état pour filtrer les événements (ex : `QC` pour Québec). Valeur par défaut : `QC`.
- **segmentName** (string, optionnel) : Le nom du segment pour filtrer les événements (ex : `Music`, `Sports`, etc.).

### Exemple de requêtes

#### 1. Récupérer des événements de `TicketMaster` pour un segment `Music` entre les dates spécifiées, avec une taille de page de 50 événements, pour l'état `QC` :

```bash
GET http://localhost:3000/events?startDateTime=2025-02-01T00:00:00Z&endDateTime=2025-06-30T23:59:59Z&pageSize=50&stateCode=QC&segmentName=Music
```

#### 2. Récupérer des événements pour un segment `Sports` avec les paramètres par défaut :

```bash
GET http://localhost:3000/events?segmentName=Sports
```

## Fonctionnement

### 1. **Récupération des événements**

Le service interroge l'API TicketMaster en utilisant les paramètres fournis dans la requête. Il récupère les événements par intervalles de 7 jours par défaut et gère la pagination pour récupérer tous les résultats si nécessaire. La clé API est passée dans les paramètres de la requête pour accéder à l'API TicketMaster.

### Lancer les tests

Pour exécuter les tests, utilisez la commande suivante :

```bash
npm run test
```
