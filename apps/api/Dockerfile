FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY apps/api/ValentinRSM.Api.csproj apps/api/
RUN dotnet restore apps/api/ValentinRSM.Api.csproj
COPY apps/api/ apps/api/
WORKDIR /src/apps/api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
HEALTHCHECK --interval=10s --timeout=5s --start-period=25s --retries=5 \
    CMD curl -fsS http://127.0.0.1:8080/health >/dev/null || exit 1
ENTRYPOINT ["dotnet", "ValentinRSM.Api.dll"]
