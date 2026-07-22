pipeline {
  agent any
  stages {
    stage('Pull latest changes') {
      steps {
        dir('/home/remnants/dev.remnant') {
          sh 'git pull origin main'
        }
      }
    }
    stage('Build backend') {
      steps {
        dir('/home/remnants/dev.remnant') {
          sh 'BUILDKIT_MAX_PARALLELISM=1 docker compose build backend'
        }
      }
    }
    stage('Build frontend') {
      steps {
        dir('/home/remnants/dev.remnant') {
          sh 'BUILDKIT_MAX_PARALLELISM=1 docker compose build frontend'
        }
      }
    }
    stage('Up') {
      steps {
        dir('/home/remnants/dev.remnant') {
          sh 'docker compose up -d --no-build'
        }
      }
    }
  }
}
