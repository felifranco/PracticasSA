FROM node:hydrogen-alpine3.19
LABEL maintainer="Feliciano Franco"
LABEL email="f64franco@gmail.com"
LABEL description = "Microservicio."
EXPOSE 3000
WORKDIR /app
COPY ./* ./
RUN npm install
CMD ["node", "server.js"]