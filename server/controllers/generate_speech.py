# Utiliser une image de base Node.js
FROM node:22

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install

# Copier le reste de l'application
COPY . .

# Installer Python et pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv ffmpeg

# Créer et activer un environnement virtuel Python
RUN python3 -m venv /usr/src/app/venv
ENV PATH="/usr/src/app/venv/bin:$PATH"

# Installer les dépendances Python dans l'environnement virtuel
RUN /usr/src/app/venv/bin/pip install --upgrade pip
RUN /usr/src/app/venv/bin/pip install TTS

# Exposer le port de l'application
EXPOSE 3000

# Commande pour lancer l'application
CMD [ "npm", "run", "dev" ]
