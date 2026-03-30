FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY services/event-service/pom.xml ./
RUN mvn -DskipTests dependency:go-offline
COPY services/event-service/src ./src
RUN mvn -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 5002
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

