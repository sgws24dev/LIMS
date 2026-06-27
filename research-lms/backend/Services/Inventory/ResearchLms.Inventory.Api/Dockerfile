FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5007

ENV ASPNETCORE_URLS=http://+:5007

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Inventory/ResearchLms.Inventory.Api/ResearchLms.Inventory.Api.csproj", "Services/Inventory/ResearchLms.Inventory.Api/"]
COPY ["Services/Inventory/ResearchLms.Inventory.Application/ResearchLms.Inventory.Application.csproj", "Services/Inventory/ResearchLms.Inventory.Application/"]
COPY ["Services/Inventory/ResearchLms.Inventory.Domain/ResearchLms.Inventory.Domain.csproj", "Services/Inventory/ResearchLms.Inventory.Domain/"]
COPY ["Services/Inventory/ResearchLms.Inventory.Infrastructure/ResearchLms.Inventory.Infrastructure.csproj", "Services/Inventory/ResearchLms.Inventory.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Inventory/ResearchLms.Inventory.Api/ResearchLms.Inventory.Api.csproj"
COPY . .
WORKDIR "/src/Services/Inventory/ResearchLms.Inventory.Api"
RUN dotnet build "ResearchLms.Inventory.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Inventory.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Inventory.Api.dll"]
