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
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ValentinRSM.Api.dll"]
