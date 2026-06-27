FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Gateway/ResearchLms.Gateway/ResearchLms.Gateway.csproj", "Gateway/ResearchLms.Gateway/"]
RUN dotnet restore "Gateway/ResearchLms.Gateway/ResearchLms.Gateway.csproj"
COPY . .
WORKDIR "/src/Gateway/ResearchLms.Gateway"
RUN dotnet build "ResearchLms.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Gateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Gateway.dll"]
