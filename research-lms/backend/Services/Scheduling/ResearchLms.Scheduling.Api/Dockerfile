FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Scheduling/ResearchLms.Scheduling.Api/ResearchLms.Scheduling.Api.csproj", "Services/Scheduling/ResearchLms.Scheduling.Api/"]
COPY ["Services/Scheduling/ResearchLms.Scheduling.Application/ResearchLms.Scheduling.Application.csproj", "Services/Scheduling/ResearchLms.Scheduling.Application/"]
COPY ["Services/Scheduling/ResearchLms.Scheduling.Domain/ResearchLms.Scheduling.Domain.csproj", "Services/Scheduling/ResearchLms.Scheduling.Domain/"]
COPY ["Services/Scheduling/ResearchLms.Scheduling.Infrastructure/ResearchLms.Scheduling.Infrastructure.csproj", "Services/Scheduling/ResearchLms.Scheduling.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Scheduling/ResearchLms.Scheduling.Api/ResearchLms.Scheduling.Api.csproj"

COPY . .
WORKDIR "/src/Services/Scheduling/ResearchLms.Scheduling.Api"
RUN dotnet build "ResearchLms.Scheduling.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Scheduling.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Scheduling.Api.dll"]
