FROM node:alpine
WORKDIR /apekub
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]