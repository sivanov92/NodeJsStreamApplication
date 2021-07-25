# syntax=docker/dockerfile:1

FROM node:14.9
ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install 

COPY . .

EXPOSE 5000 8000 1935

CMD [ "node", "app.js" ]