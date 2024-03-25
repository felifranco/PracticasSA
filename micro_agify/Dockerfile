FROM node:hydrogen-alpine3.19
LABEL maintainer="Feliciano Franco"
LABEL email="f64franco@gmail.com"
LABEL description = "Microservicio Agify."
EXPOSE 3000
WORKDIR /app
COPY ./Server/src/package.json ./
COPY ./Server/src/swagger.js ./
COPY ./Server/src/server.js ./
CMD ["npm", "run", "start"]