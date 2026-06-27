FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5002

ENV ASPNETCORE_URLS=http://+:5002

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Institution/ResearchLms.Institution.Api/ResearchLms.Institution.Api.csproj", "Services/Institution/ResearchLms.Institution.Api/"]
COPY ["Services/Institution/ResearchLms.Institution.Application/ResearchLms.Institution.Application.csproj", "Services/Institution/ResearchLms.Institution.Application/"]
COPY ["Services/Institution/ResearchLms.Institution.Domain/ResearchLms.Institution.Domain.csproj", "Services/Institution/ResearchLms.Institution.Domain/"]
COPY ["Services/Institution/ResearchLms.Institution.Infrastructure/ResearchLms.Institution.Infrastructure.csproj", "Services/Institution/ResearchLms.Institution.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Institution/ResearchLms.Institution.Api/ResearchLms.Institution.Api.csproj"
COPY . .
WORKDIR "/src/Services/Institution/ResearchLms.Institution.Api"
RUN dotnet build "ResearchLms.Institution.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Institution.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Institution.Api.dll"]
