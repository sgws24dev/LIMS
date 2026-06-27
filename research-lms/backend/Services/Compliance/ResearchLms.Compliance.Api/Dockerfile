FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5009

ENV ASPNETCORE_URLS=http://+:5009

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Compliance/ResearchLms.Compliance.Api/ResearchLms.Compliance.Api.csproj", "Services/Compliance/ResearchLms.Compliance.Api/"]
COPY ["Services/Compliance/ResearchLms.Compliance.Application/ResearchLms.Compliance.Application.csproj", "Services/Compliance/ResearchLms.Compliance.Application/"]
COPY ["Services/Compliance/ResearchLms.Compliance.Domain/ResearchLms.Compliance.Domain.csproj", "Services/Compliance/ResearchLms.Compliance.Domain/"]
COPY ["Services/Compliance/ResearchLms.Compliance.Infrastructure/ResearchLms.Compliance.Infrastructure.csproj", "Services/Compliance/ResearchLms.Compliance.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Compliance/ResearchLms.Compliance.Api/ResearchLms.Compliance.Api.csproj"

COPY . .
WORKDIR "/src/Services/Compliance/ResearchLms.Compliance.Api"
RUN dotnet build "ResearchLms.Compliance.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Compliance.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Compliance.Api.dll"]
