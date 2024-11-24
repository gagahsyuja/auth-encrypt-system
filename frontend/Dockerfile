FROM node:18

WORKDIR /app

RUN mkdir /app/frontend

COPY ./package.json /app

RUN npm install

COPY . /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
