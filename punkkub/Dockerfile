FROM node:alpine
WORKDIR /punkkub
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]