# instalar
npm install -g serverless

# verificando instalação
sls -v

# inicializar serverless
sls

# sempre fazer o deploy antes de tudo para verificar se está com ambiente ok
cd hello-sls && sls deploy

# invocar
cd hello-sls && sls invoke -f hello

# invocar local
cd hello-sls && sls invoke local -f hello --log

# configurar dashboard
cd hello-sls && sls dashboard

# verificando logs chamadas aws
cd hello-sls && sls logs -f hello --tail

# remove
cd hello-sls && sls remove