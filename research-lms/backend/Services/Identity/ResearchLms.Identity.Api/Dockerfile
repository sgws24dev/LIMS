FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5001

ENV ASPNETCORE_URLS=http://+:5001

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Identity/ResearchLms.Identity.Api/ResearchLms.Identity.Api.csproj", "Services/Identity/ResearchLms.Identity.Api/"]
COPY ["Services/Identity/ResearchLms.Identity.Application/ResearchLms.Identity.Application.csproj", "Services/Identity/ResearchLms.Identity.Application/"]
COPY ["Services/Identity/ResearchLms.Identity.Domain/ResearchLms.Identity.Domain.csproj", "Services/Identity/ResearchLms.Identity.Domain/"]
COPY ["Services/Identity/ResearchLms.Identity.Infrastructure/ResearchLms.Identity.Infrastructure.csproj", "Services/Identity/ResearchLms.Identity.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Identity/ResearchLms.Identity.Api/ResearchLms.Identity.Api.csproj"
COPY . .
WORKDIR "/src/Services/Identity/ResearchLms.Identity.Api"
RUN dotnet build "ResearchLms.Identity.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Identity.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Identity.Api.dll"]
