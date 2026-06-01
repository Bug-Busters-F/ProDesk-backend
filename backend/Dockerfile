FROM node:22-alpine

WORKDIR /backend

COPY package*.json ./

RUN npm install --quiet --no-optional --no-fund --loglevel=error

COPY . .

EXPOSE ${PORT:-3000}

RUN npm run build

CMD ["npm", "run", "start:prod"]