FROM node:20-alpine

WORKDIR /app

# Copy the full static site before installing. Do not install from
# package manifests alone — this is not a Python src-layout package.
COPY . .
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "exec ./node_modules/.bin/serve -s . -l tcp://0.0.0.0:${PORT:-3000}"]
