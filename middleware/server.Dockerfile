FROM node:hydrogen-alpine3.19
LABEL maintainer="Feliciano Franco"
LABEL email="f64franco@gmail.com"
LABEL description = "Middleware."
ARG MICRO_AGIFY
ARG MICRO_GENDERIZE
ENV MICRO_AGIFY $MICRO_AGIFY
ENV MICRO_GENDERIZE $MICRO_GENDERIZE
EXPOSE 3000
WORKDIR /app
COPY Server/package.json ./
COPY Server/swagger.js ./
COPY Server/server.js ./
RUN apk add curl
CMD ["npm", "run", "start"]