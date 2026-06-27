FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5003

ENV ASPNETCORE_URLS=http://+:5003

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Facility/ResearchLms.Facility.Api/ResearchLms.Facility.Api.csproj", "Services/Facility/ResearchLms.Facility.Api/"]
COPY ["Services/Facility/ResearchLms.Facility.Application/ResearchLms.Facility.Application.csproj", "Services/Facility/ResearchLms.Facility.Application/"]
COPY ["Services/Facility/ResearchLms.Facility.Domain/ResearchLms.Facility.Domain.csproj", "Services/Facility/ResearchLms.Facility.Domain/"]
COPY ["Services/Facility/ResearchLms.Facility.Infrastructure/ResearchLms.Facility.Infrastructure.csproj", "Services/Facility/ResearchLms.Facility.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Facility/ResearchLms.Facility.Api/ResearchLms.Facility.Api.csproj"
COPY . .
WORKDIR "/src/Services/Facility/ResearchLms.Facility.Api"
RUN dotnet build "ResearchLms.Facility.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Facility.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Facility.Api.dll"]
