# Gova-Elite

## Authors

- :deciduous_tree: [@Ayman-BEDDA](https://github.com/Ayman-BEDDA)
- :zap: [@Maxime-Lao](https://github.com/Maxime-Lao)
- :sunny: [@muthuxv](https://github.com/muthuxv)
- :snowflake: [@SimonBTSSio](https://github.com/SimonBTSSio)

## Fonctionnalités

- Api vocal (Envoi d'une réponse vocal/audio) :sunny: [@muthuxv](https://github.com/muthuxv) :deciduous_tree: [@Ayman-BEDDA](https://github.com/Ayman-BEDDA)
- Api vision (Analyse d'image médicale) :sunny: [@muthuxv](https://github.com/muthuxv)
- Api réponse (Génération d'une réponse) :zap: [@Maxime-Lao](https://github.com/Maxime-Lao)
- Api report (Génération d'un rapport médical) :zap: [@Maxime-Lao](https://github.com/Maxime-Lao)
- Temps réel :sunny: [@muthuxv](https://github.com/muthuxv) :snowflake: [@SimonBTSSio](https://github.com/SimonBTSSio)
- Espace professionnel de santé :deciduous_tree: [@Ayman-BEDDA](https://github.com/Ayman-BEDDA)
- Espace patient :sunny: [@muthuxv](https://github.com/muthuxv)
- Cleancode :snowflake: [@SimonBTSSio](https://github.com/SimonBTSSio)

## Procédure d’installation et de lancement de l'application

- Dans le dossier "server", ajouter un fichier ".env" et mettre les variables suivantes:
- 
```bash
DATABASE_URL=postgres://root:password@localhost:5439/app
JWT_SECRET=
OPENAI_API_KEY=
```

- A la racine du projet, faire un "docker compose up -d"
- Dans les dossiers "server" et "client", faire un "npm i"
- Dans le dossier "server", faire un "npm run dev"
- Dans le dossier "client, faire un "npm run start"
