FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5010

ENV ASPNETCORE_URLS=http://+:5010

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Services/Communications/ResearchLms.Communications.Api/ResearchLms.Communications.Api.csproj", "Services/Communications/ResearchLms.Communications.Api/"]
COPY ["Services/Communications/ResearchLms.Communications.Application/ResearchLms.Communications.Application.csproj", "Services/Communications/ResearchLms.Communications.Application/"]
COPY ["Services/Communications/ResearchLms.Communications.Domain/ResearchLms.Communications.Domain.csproj", "Services/Communications/ResearchLms.Communications.Domain/"]
COPY ["Services/Communications/ResearchLms.Communications.Infrastructure/ResearchLms.Communications.Infrastructure.csproj", "Services/Communications/ResearchLms.Communications.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Communications/ResearchLms.Communications.Api/ResearchLms.Communications.Api.csproj"

COPY . .
WORKDIR "/src/Services/Communications/ResearchLms.Communications.Api"
RUN dotnet build "ResearchLms.Communications.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Communications.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Communications.Api.dll"]
