FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/AssignmentManagement.Domain/AssignmentManagement.Domain.csproj backend/AssignmentManagement.Domain/
COPY backend/AssignmentManagement.Application/AssignmentManagement.Application.csproj backend/AssignmentManagement.Application/
COPY backend/AssignmentManagement.Infrastructure/AssignmentManagement.Infrastructure.csproj backend/AssignmentManagement.Infrastructure/
COPY backend/AssignmentManagement.Api/AssignmentManagement.Api.csproj backend/AssignmentManagement.Api/
RUN dotnet restore backend/AssignmentManagement.Api/AssignmentManagement.Api.csproj
COPY backend/ backend/
RUN dotnet publish backend/AssignmentManagement.Api/AssignmentManagement.Api.csproj -c Release -o /app/publish --no-restore
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","AssignmentManagement.Api.dll"]
