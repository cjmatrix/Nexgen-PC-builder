
FROM node:22.18.0-alpine


WORKDIR /app


COPY package*.json ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install


COPY . .


EXPOSE 5000

CMD ["npm", "run", "start"]
