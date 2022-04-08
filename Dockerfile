FROM node:14.17.4-alpine

RUN mkdir /out

COPY package.json package.json
RUN npm install

COPY .babelrc ./
COPY src src
RUN npm run build \
  && rm -rf src

COPY src/swagger.yaml dist/swagger.yaml

CMD ["node", "dist/index.js"]