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
    stage('Build and Run') {
      steps {
        dir('/home/remnants/dev.remnant') {
          sh 'docker compose down'
          sh 'docker compose up -d --build'
        }
      }
    }
  }
}