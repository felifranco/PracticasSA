FROM node:hydrogen-alpine3.19
LABEL maintainer="Feliciano Franco"
LABEL email="f64franco@gmail.com"
LABEL description = "Microservicio 2."
EXPOSE 3000
WORKDIR /app
COPY ./package.json ./
COPY ./swagger.js ./
COPY ./server.js ./
CMD ["npm", "run", "start"]