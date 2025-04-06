pipeline {
  agent any

  parameters {
    string(name: 'IMAGE_NAME',          defaultValue: 'joeqi/cloud-crafter-lab',          description: 'Docker image name')
    string(name: 'IMAGE_TAG',           defaultValue: 'fe-1',                             description: 'Docker image tag')
    string(name: 'ENV_VARIABLE',        defaultValue: 'your-env-value',                   description: 'Generic environment variable')
    string(name: 'NEXT_PUBLIC_API_URL', defaultValue: 'http://backend:8080/query',        description: 'Public API URL for Next.js')
    string(name: 'PRIVATE_API_URL',     defaultValue: 'http://backend:8080/query',        description: 'Private API URL')
    string(name: 'EC2_HOST',            defaultValue: 'ec2-user@<your-ec2-ip>',           description: 'EC2 Host (e.g., ec2-user@1.2.3.4)')
  }

  environment {
    BUILDKIT_HOST = 'tcp://buildkitd:1234'
    DOCKER_IMAGE  = "${params.IMAGE_NAME}:${params.IMAGE_TAG}"
    DOCKER_CREDS  = 'docker-hub-credentials-id'
    SSH_CREDS     = 'ec2-ssh-credentials-id'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Push with BuildKit') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
              echo "Docker Hub user: $DOCKER_USER"
              echo "🔐 Writing Docker Hub credentials to ~/.docker/config.json..."
              mkdir -p ~/.docker
              # 使用 shell 脚本中的变量替换生成合法 JSON 配置
              DOCKER_AUTH=$(echo -n "$DOCKER_USER:$DOCKER_PASS" | base64)
              echo "{\"auths\":{\"https://index.docker.io/v1/\":{\"auth\":\"$DOCKER_AUTH\"}}}" > ~/.docker/config.json
              cat ~/.docker/config.json

              echo "🔧 Building & pushing Docker image using BuildKit..."
              buildctl --addr $BUILDKIT_HOST build \\
                --frontend dockerfile.v0 \\
                --local context=. \\
                --local dockerfile=. \\
                --opt filename=Dockerfile \\
                --opt build-arg:ENV_VARIABLE=$ENV_VARIABLE \\
                --opt build-arg:NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \\
                --opt build-arg:PRIVATE_API_URL=$PRIVATE_API_URL \\
                --output type=registry,ref=$DOCKER_IMAGE,push=true
            '''
          }
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(credentials: ["${SSH_CREDS}"]) {
          sh '''
            echo "🚀 Deploying to EC2..."
            ssh -o StrictHostKeyChecking=no $EC2_HOST << 'EOF'
              docker pull $DOCKER_IMAGE
              docker stop next-app || true
              docker rm next-app || true
              docker run -d --name next-app -p 3000:3000 \\
                -e ENV_VARIABLE=$ENV_VARIABLE \\
                -e NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \\
                -e PRIVATE_API_URL=$PRIVATE_API_URL \\
                $DOCKER_IMAGE
EOF
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment completed successfully."
    }
    failure {
      echo "❌ Deployment failed. Check the logs."
    }
  }
}
