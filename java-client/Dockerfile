FROM maven:3.8-openjdk-11-slim AS build
WORKDIR /app
COPY src src
COPY pom.xml .
COPY applicationinsights.json .
RUN curl -LfsSo applicationinsights-agent.jar https://github.com/microsoft/ApplicationInsights-Java/releases/download/3.1.1/applicationinsights-agent-3.1.1.jar
RUN mvn clean package && \
    mv target/java-client*.jar app.jar
ENTRYPOINT ["java", "-javaagent:/app/applicationinsights-agent.jar", "-jar", "/app/app.jar"]
