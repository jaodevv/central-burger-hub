#!/bin/bash
echo "🚀 Iniciando Sincronização DashMenu..."
git add .
echo "Digite o motivo da alteração (commit):"
read message
git commit -m "$message"
git push origin main
echo "✅ Alterações enviadas para o GitHub!"
