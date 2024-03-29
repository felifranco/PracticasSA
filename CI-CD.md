# Continuous Integration

Repo > Build > Pipelines > Use Docker template

Crear el archivo `.gitlab-ci.yml`

https://docs.gitlab.com/ee/ci/yaml/index.html

https://docs.gitlab.com/ee/ci/pipelines/pipeline_architectures.html#basic-pipelines

https://docs.gitlab.com/ee/ci/yaml/index.html#stages

https://docs.gitlab.com/ee/ci/variables/

https://docs.gitlab.com/ee/ci/variables/predefined_variables.html

```yml
# This file is a template, and might need editing before it works on your project.
# To contribute improvements to CI/CD templates, please follow the Development guide at:
# https://docs.gitlab.com/ee/development/cicd/templates.html
# This specific template is located at:
# https://gitlab.com/gitlab-org/gitlab/-/blob/master/lib/gitlab/ci/templates/Docker.gitlab-ci.yml

# Build a Docker image with CI/CD and push to the GitLab registry.
# Docker-in-Docker documentation: https://docs.gitlab.com/ee/ci/docker/using_docker_build.html
#
# This template uses one generic job with conditional builds
# for the default branch and all other (MR) branches.

docker-build:
  # Use the official docker image.
  image: docker:cli
  stage: build
  services:
    - docker:dind
  variables:
    DOCKER_IMAGE_NAME: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
  # All branches are tagged with $DOCKER_IMAGE_NAME (defaults to commit ref slug)
  # Default branch is also tagged with `latest`
  script:
    - docker build --pull -t "$DOCKER_IMAGE_NAME" .
    - docker push "$DOCKER_IMAGE_NAME"
    - |
      if [[ "$CI_COMMIT_BRANCH" == "$CI_DEFAULT_BRANCH" ]]; then
        docker tag "$DOCKER_IMAGE_NAME" "$CI_REGISTRY_IMAGE:latest"
        docker push "$CI_REGISTRY_IMAGE:latest"
      fi
  # Run this job in a branch where a Dockerfile exists
  rules:
    - if: $CI_COMMIT_BRANCH
      exists:
        - Dockerfile
```

## GitLab Runner

Se utilizará un contenedor de GitLab Runner para ejecutar los pipelines. Se utilizará la documentación de oficial para [Instalar GitLab Runner](https://docs.gitlab.com/runner/install/) pero particularmente [Correr GitLab Runner en un contenedor](https://docs.gitlab.com/runner/install/docker.html).

Primero se debe descargar la imagen desde [Docker Hub](https://hub.docker.com/r/gitlab/gitlab-runner/tags) con el siguiente comando:

```shell
docker pull gitlab/gitlab-runner:latest
```

Se puede probar GitLab Runner en un contenedor desechable ejecutando el `runner commnad and options`, la estructura para ejecutar es `docker run <chosen docker options...> gitlab/gitlab-runner <runner command and options...>`. Por ejemplo:

```shell
docker run --rm -t -i gitlab/gitlab-runner --help
```

La documentación oficial indica:

```
In short, the gitlab-runner part of the command is replaced with docker run [docker options] gitlab/gitlab-runner, while the rest of the command stays as it is described in the register documentation. The only difference is that the gitlab-runner command is executed inside of a Docker container.
```

Eso quiere decir que podemos utilizar gitlab-runner como si estuviera instalada en el equipo local, puede ejecutar todos los comandos descritos en la documentación oficial

### Crear un nuevo `Runner`

De acuerdo a la documentación oficial se debe [crear un nuevo `Project Runner`](https://docs.gitlab.com/ee/ci/runners/runners_scope.html#create-a-project-runner-with-a-runner-authentication-token). Para hacerlo se deben seguir los siguientes pasos:

1. Ingresar al proyecto de GitLab, ubicar la barra lateral izquierda.
2. Seleccionar **Settings > CI/CD.**
3. Expandir la sección **Runners**.
4. Seleccionar **New project runner**.
5. Seleccionar el **Sistema Operativo** donde GitLab Runner está instalado. En nuestro caso será **Linux** puesto que utilizamos una imagen de Docker con ese OS.
6. En la sección de Tags, en el campo de Tags, ingresar las etiquetas de trabajo para especificarle al runner cuáles puede ejecutar. Si no hay etiquetas de trabajo para el runner entonces seleccionar **Run untagged jobs**.
7. Opcional. En el campo de **descripción** del Runner, agregar una descripción para el Runner que se mostrará en GitLab.
8. Opcional. En la sección de **Configuration**, agregarconfiguraciones adicionales.
9. Seleccionar **Create runner**.

**IMPORTANTE**: Anotar el token generado con formato `glrt-xxxxx`, éste se utilizará para el registro del Runner.

### Crear un contenedor con GitLab Runner

De acuerdo a la [documentación](https://docs.gitlab.com/runner/install/docker.html#option-2-use-docker-volumes-to-start-the-runner-container) primero crearémos un volúmen:

```shell
docker volume create gitlab-runner-config
```

Luego creamos un contenedor y le asociamos el volúmen recién creado:

```shell
docker run -d --name gitlab-runner --restart always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v gitlab-runner-config:/etc/gitlab-runner \
    gitlab/gitlab-runner:latest
```

### Registrar el Runner

Para [registrar el Runner con autenticación por Token](https://docs.gitlab.com/runner/register/index.html?tab=Docker#register-with-a-runner-authentication-token) crearémos un contenedor desechable con los valores del nuevo Runner. Ingresar el valor del token generado anteriormente en la [creación del nuevo runner](#crear-un-nuevo-runner) a la variable `$RUNNER_TOKEN`, definir la imagen Docker que se utilizará para los pipelines con el argumento `--docker-image docker:dind`: El comando quedaría así:

```shell
docker run --rm -v create gitlab-runner-config:/etc/gitlab-runner gitlab/gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com/" \
  --token "$RUNNER_TOKEN" \
  --executor "docker" \
  --docker-image docker:dind \
  --description "docker-runner"
```

Si correr el comando anterior no funciona para registrar el Runner también se puede probar ingresar al [contenedor creado](#crear-un-contenedor-con-gitlab-runner) con el comando:

```shell
docker exec -it gitlab-runner bash
```

dentro del contenedor `gitlab-runner` ejecutar:

```shell
gitlab-runner register
```

y completar los datos solicitados. Además del ingreso de los datos tuve que hacer una modificación al archivo de configuración `config.toml` porque _GitLab Runner_ no tenía vinculado el volúmen de mi docker local y no tenía permisos de crear contenedores así que primero instalé un editor de texto con los siguientes comandos:

```shell
apt update
apt install nano
```

Antes de la modificación el archivo se encuentra así:

```toml
$ cat /etc/gitlab-runner/config.toml
concurrent = 1
check_interval = 0
connection_max_age = "15m0s"
shutdown_timeout = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "runner-docker-25-0-5"
  url = "https://gitlab.com/"
  id = 34232754
  token = "glrt-9Ar..."
  token_obtained_at = 2024-03-29T18:22:03Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  [runners.cache]
    MaxUploadedArchiveSize = 0
  [runners.docker]
    tls_verify = false
    image = "docker:25.0.5"
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
    network_mtu = 0
```

Abrir el archivo para modificarlo

```shell
nano /etc/gitlab-runner/config.toml
```

Edité los valores de `privileged = true` y `volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]`. Notar que en el valor `image = "docker:25.0.5"` tiene la versión de docker de mi equipo local, se puede probar utilizar el tag `docker:latest` pero en esta ocación no se hizo. El archivo final de la siguiente forma:

```toml
$ cat /etc/gitlab-runner/config.toml
concurrent = 1
check_interval = 0
connection_max_age = "15m0s"
shutdown_timeout = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "runner-docker-25-0-5"
  url = "https://gitlab.com/"
  id = 34232754
  token = "glrt-9Ar..."
  token_obtained_at = 2024-03-29T18:22:03Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  [runners.cache]
    MaxUploadedArchiveSize = 0
  [runners.docker]
    tls_verify = false
    image = "docker:25.0.5"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
    shm_size = 0
    network_mtu = 0
```

Reiniciar el contenedor:

```shell
docker restart gitlab-runner
```

Con esto se finaliza la configuración del `Runner local`, ahora solo queda visualizar los _logs_ de las tareas que se ejecutan en él:

```shell
docker logs gitlab-runner --follow
```

**IMPORTANTE**: Para canalizar el trabajo de los pipelines a éste Runner es importante desabilitar los Runners compartidos.

## Docker Compose

```shell
sudo dnf install docker-compose
```

```shell
docker build --tag micro_agify -f server.Dockerfile .

docker run -d --name m_agify -p 3000:3000 --env HOST=0.0.0.0 --env PORT=3000 micro_agify:latest
```

```shell
docker build --tag testing_agify -f testing.Dockerfile .

docker run --name t_agify testing_agify

docker run --name t_agify --env SERVER="http://172.17.0.1:3011" testing_agify
```

npm install -D jest supertest

# Referencias

[GitLab CI/CD - Providing your own docker runners](https://www.youtube.com/watch?v=Y0qT6MCnRG0)
