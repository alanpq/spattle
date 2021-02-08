FROM node:14

WORKDIR /spattle
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build-vue
RUN npm run build-server

RUN npm i -g nodemon typescript
RUN cp index.html dist/index.html

EXPOSE 3000
CMD ["node", "./dist/index.js"]