FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Projects/ResearchLms.Projects.Api/ResearchLms.Projects.Api.csproj", "Services/Projects/ResearchLms.Projects.Api/"]
COPY ["Services/Projects/ResearchLms.Projects.Infrastructure/ResearchLms.Projects.Infrastructure.csproj", "Services/Projects/ResearchLms.Projects.Infrastructure/"]
COPY ["Services/Projects/ResearchLms.Projects.Application/ResearchLms.Projects.Application.csproj", "Services/Projects/ResearchLms.Projects.Application/"]
COPY ["Services/Projects/ResearchLms.Projects.Domain/ResearchLms.Projects.Domain.csproj", "Services/Projects/ResearchLms.Projects.Domain/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Projects/ResearchLms.Projects.Api/ResearchLms.Projects.Api.csproj"

COPY . .
WORKDIR "/src/Services/Projects/ResearchLms.Projects.Api"
RUN dotnet build "ResearchLms.Projects.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Projects.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Projects.Api.dll"]
