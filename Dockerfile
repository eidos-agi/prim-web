FROM nginx:alpine
ENV PORT=80
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template
RUN rm /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
