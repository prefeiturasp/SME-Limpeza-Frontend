# Gestão de Limpeza - SME-SP

O sistema para gestão das atividades de limpeza dos ambientes das unidades escolares possui duas ferramentas:


- **Aplicativo Mobile:** de uso exclusivo dos Prestadores de Serviço para o registro da realização das atividades.
- **Retaguarda Web:** para cadastros gerais e acomapnhamento dos monitoramentos, fiscalização e faturamento.

## Frontend

Desenvolvido com AngularJS.

Para executar o projeto, siga os seguintes passos: 
- Configurar um subdomínio apontando para o ip da máquina host 
- Configurar a URL base e a porta da API no arquivo **core/constantes/rest.constantes.js**
- Executar o seguinte comando para criar a imagem do Docker:

```bash
  docker build -t <nome_da_imagem> .
```

- Executar o seguinte comando para criar a o container do Docker:
```bash
  docker run -d -p 80:80 --name <nome_do_container> <nome_da_imagem>
```