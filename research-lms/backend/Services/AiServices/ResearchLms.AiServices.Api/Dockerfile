FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5012

ENV ASPNETCORE_URLS=http://+:5012

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/AiServices/ResearchLms.AiServices.Api/ResearchLms.AiServices.Api.csproj", "Services/AiServices/ResearchLms.AiServices.Api/"]
COPY ["Services/AiServices/ResearchLms.AiServices.Application/ResearchLms.AiServices.Application.csproj", "Services/AiServices/ResearchLms.AiServices.Application/"]
COPY ["Services/AiServices/ResearchLms.AiServices.Domain/ResearchLms.AiServices.Domain.csproj", "Services/AiServices/ResearchLms.AiServices.Domain/"]
COPY ["Services/AiServices/ResearchLms.AiServices.Infrastructure/ResearchLms.AiServices.Infrastructure.csproj", "Services/AiServices/ResearchLms.AiServices.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/AiServices/ResearchLms.AiServices.Api/ResearchLms.AiServices.Api.csproj"
COPY . .
WORKDIR "/src/Services/AiServices/ResearchLms.AiServices.Api"
RUN dotnet build "ResearchLms.AiServices.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.AiServices.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.AiServices.Api.dll"]
