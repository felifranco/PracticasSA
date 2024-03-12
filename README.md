# Práctica 2 - Software avanzado

## Creación del proyecto

```shell
npm install swagger-ui-express
npm install swagger-autogen


npm install --save-dev swagger-autogen
npm install swagger-ui-express --save
```

## Dockerfile

```yaml
FROM node:hydrogen-alpine3.19
LABEL maintainer="Feliciano Franco"
LABEL email="f64franco@gmail.com"
LABEL description = "Microservicio 1."
EXPOSE 3000
WORKDIR /app
COPY ./package.json ./
COPY ./swagger.js ./
COPY ./server.js ./
CMD ["npm", "run", "start"]
```

## Crear la imágen

Ubicarse dentro de la carpeta del microservicio

```shell
cd microservicio_1
```

```shell
docker build --tag f64franco/micro1:practica2 ./
```

```shell
docker run -d --name micro1 -p 3000:3000 --env HOST=0.0.0.0 --env PORT=3000 f64franco/micro1:practica2
```

## Minikube

## Arranque

### MICROSERVICIO 1

```shell
$ kubectl apply -f micro1-deployment.yaml
$ kubectl expose deployment micro1-deployment --type=NodePort
$ minikube service micro1-deployment --url
```

Mavegador: `http://192.168.49.2:30741`
Probando API: `http://192.168.49.2:30741/?name=peter`


## GCP

### Crear cluster

Aspectos básicos del cluster
```
Nombre: cluster-practicasa
region: us-central1
```

Configuración avanzada
```
Descripción: Cluster utilizado para Practicas SA
```

Todo lo demás queda predeterminado.