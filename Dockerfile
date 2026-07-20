FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "npx serve -s . -l tcp://0.0.0.0:${PORT:-3000}"]
