FROM node:20.15.0 as development

WORKDIR /opt/service

COPY . .

RUN npm install

CMD [ "npm", "run", "start:dev" ]

#######################################

FROM node:20.15.0 as production

WORKDIR /opt/service

COPY . .

RUN npm install pm2@5.4.1 -g && npm install --production && npm run build

CMD ["pm2-runtime", "/opt/services/ecosystem.config.cjs", "--only", "reservation-service"]
