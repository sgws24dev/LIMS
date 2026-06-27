FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5011

ENV ASPNETCORE_URLS=http://+:5011
ENV ASPNETCORE_ENVIRONMENT=Development

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Content/ResearchLms.Content.Api/ResearchLms.Content.Api.csproj", "Services/Content/ResearchLms.Content.Api/"]
COPY ["Services/Content/ResearchLms.Content.Application/ResearchLms.Content.Application.csproj", "Services/Content/ResearchLms.Content.Application/"]
COPY ["Services/Content/ResearchLms.Content.Domain/ResearchLms.Content.Domain.csproj", "Services/Content/ResearchLms.Content.Domain/"]
COPY ["Services/Content/ResearchLms.Content.Infrastructure/ResearchLms.Content.Infrastructure.csproj", "Services/Content/ResearchLms.Content.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Content/ResearchLms.Content.Api/ResearchLms.Content.Api.csproj"

COPY . .
WORKDIR "/src/Services/Content/ResearchLms.Content.Api"
RUN dotnet build "ResearchLms.Content.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Content.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost:5011/health || exit 1
ENTRYPOINT ["dotnet", "ResearchLms.Content.Api.dll"]
