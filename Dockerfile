FROM node:21.7 as base

ENV NODE_ENV build

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

COPY --chown=node:node . ./

#######################################

FROM base as builder

WORKDIR /home/node/app
USER node

RUN npm i
RUN npm run build


######################################

FROM node:21.7 as production

WORKDIR /home/node/app
USER node

COPY --from=builder --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/app/package*.json ./
COPY --from=builder --chown=node:node /home/node/app/dist/ ./dist

# Expose the port the app runs on
EXPOSE 3000

# Healthcheck to ensure the application is responding
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "require('http').get({host: 'localhost', port: 3000, path: '/'}, res => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/main.js"]