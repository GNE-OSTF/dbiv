FROM node:argon

RUN useradd -g users -m -s /bin/bash app
WORKDIR /home/app

COPY static /home/app/static
COPY classes /home/app/classes
COPY app.js /home/app/app.js
COPY package.json /home/app/package.json

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]