# dio-lab002-microsoftazure
Site gerador de qrcode para docker no azure
![image](https://github.com/user-attachments/assets/b2d5bc26-7590-441d-aaa4-7a1c7dd94180)

Instalação do docker no kubuntu 24.04 para criação da image
https://docs.docker.com/engine/install/linux-postinstall/
 sudo apt-get update
 sudo apt-get install ca-certificates curl
 sudo install -m 0755 -d /etc/apt/keyrings
 sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
 sudo chmod a+r /etc/apt/keyrings/docker.asc
 echo   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
 $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
 1083  sudo apt-get update
 sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
 sudo groupadd docker
 sudo usermod -aG docker $USER
 newgrp docker
 sudo newgrp docker

 #Teste local
 docker build -t qrcode-wosores-app:latest .
 docker run -d -p 80:80 qrcode-wosores-app:latest
 docker tag qrcode-wosores-app:latest blogwilliamcr.azurecr.io/blog-william-app:latest

#instalação do az no ubuntu
https://learn.microsoft.com/pt-br/cli/azure/install-azure-cli-linux?pivots=apt
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -sLS https://packages.microsoft.com/keys/microsoft.asc |
  gpg --dearmor | sudo tee /etc/apt/keyrings/microsoft.gpg > /dev/null
sudo chmod go+r /etc/apt/keyrings/microsoft.gpg
AZ_DIST=$(lsb_release -cs)
echo "Types: deb
URIs: https://packages.microsoft.com/repos/azure-cli/
Suites: ${AZ_DIST}
Components: main
Architectures: $(dpkg --print-architecture)
Signed-by: /etc/apt/keyrings/microsoft.gpg" | sudo tee /etc/apt/sources.list.d/azure-cli.sources
sudo apt-get update
sudo apt-get install azure-cli
az login


 #Criação dos container no azure  
 az provider register --namespace Microsoft.OperationalInsights --wait
 az containerapp env create --name blog-william-app --resource-group containerlab03 --location eastus
 az containerapp create --name blog-william-app --resource-group containerlab03 --image blogwilliamcr.azurecr.io/blog-william-app:latest --environment blog-william-app --target-port 80 --ingress external --registry-username seusuario --registry-password seupassword --registry-server blogwilliamcr.azurecr.io

 


