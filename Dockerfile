FROM node:22-alpine
WORKDIR /app
COPY buildflow-runtime/bundle.b64 /tmp/bundle.b64
RUN base64 -d /tmp/bundle.b64 | tar -xz -C /app && rm /tmp/bundle.b64
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","server.mjs"]
