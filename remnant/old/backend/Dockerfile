FROM node
RUN apt-get update
RUN apt install curl -y
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN mkdir -p /node_modules && chown -R node:node /node_modules

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 3001

CMD ["npm", "start"]