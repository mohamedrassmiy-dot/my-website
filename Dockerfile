FROM node:22-alpine
WORKDIR /app
COPY buildflow-runtime/parts/ /tmp/parts/
RUN cat /tmp/parts/part00 /tmp/parts/part01 /tmp/parts/part02 /tmp/parts/part03 /tmp/parts/part04 > /tmp/bundle.b64 \
 && base64 -d /tmp/bundle.b64 > /tmp/buildflow.tar.gz \
 && tar -xzf /tmp/buildflow.tar.gz -C /app \
 && rm -rf /tmp/parts /tmp/bundle.b64 /tmp/buildflow.tar.gz
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","server.mjs"]
