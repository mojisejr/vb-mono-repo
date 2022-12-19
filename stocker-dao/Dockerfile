FROM node:alpine
WORKDIR /stocker-dao
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]