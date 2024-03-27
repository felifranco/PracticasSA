FROM node:hydrogen-alpine3.19
LABEL maintainer="Feliciano Franco"
LABEL email="f64franco@gmail.com"
LABEL description = "Middleware testing server."
ARG SERVER
ENV SERVER $SERVER
EXPOSE 3000
WORKDIR /testing
COPY Server/package.json ./
COPY Server/tests ./tests
RUN echo SERVER=${SERVER} will be testing
RUN npm install
CMD ["npm", "test"]