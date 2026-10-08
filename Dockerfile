FROM node:22-alpine
WORKDIR /app
COPY buildflow-runtime/bundle.tar.gz /tmp/buildflow.tar.gz
RUN tar -xzf /tmp/buildflow.tar.gz -C /app && rm /tmp/buildflow.tar.gz
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","server.mjs"]
